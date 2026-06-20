// Import .docx BEZ ZALEŻNOŚCI.
// .docx to po prostu archiwum ZIP; rozpakowujemy 'word/document.xml' natywnym
// DecompressionStream przeglądarki i ściągamy z niego czysty tekst.
//
// Architektura: logika ZIP/I-O jest osobno, a konwersja XML->tekst to czysta,
// testowalna funkcja (documentXmlToText).

function decodeXmlEntities(s: string): string {
	return s
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hx) => String.fromCodePoint(parseInt(hx, 16)))
		.replace(/&amp;/g, "&")
}

function paragraphText(p: string): string {
	const withBreaks = p
		.replace(/<w:tab\b[^>]*\/?>/g, "\t")
		.replace(/<w:(?:br|cr)\b[^>]*\/?>/g, "\n")
		.replace(/<[^>]+>/g, "")
	return decodeXmlEntities(withBreaks)
}

/**
 * Czysta funkcja: zamienia treść word/document.xml na zwykły tekst.
 * Każdy akapit (<w:p>) to osobna linia; <w:tab> -> tab, <w:br> -> nowa linia.
 */
export function documentXmlToText(xml: string): string {
	const bodyMatch = xml.match(/<w:body[\s\S]*<\/w:body>/)
	const body = bodyMatch ? bodyMatch[0] : xml
	const paragraphs = body.split(/<\/w:p>/)
	const lines = paragraphs.map((p) => paragraphText(p).replace(/[ \t]+\n/g, "\n").trimEnd())
	return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	const ds = new DecompressionStream("deflate-raw")
	// new Uint8Array(bytes) kopiuje dane do bufora opartego o ArrayBuffer (nie SharedArrayBuffer),
	// dzięki czemu typ pasuje do BlobPart w nowszych lib.dom (TS 5.7+).
	const stream = new Blob([new Uint8Array(bytes)]).stream().pipeThrough(ds)
	const ab = await new Response(stream).arrayBuffer()
	return new Uint8Array(ab)
}

// Minimalny czytnik ZIP oparty na centralnym katalogu (End Of Central Directory).
async function readZipEntry(buf: ArrayBuffer, target: string): Promise<string | null> {
	const view = new DataView(buf)
	const bytes = new Uint8Array(buf)
	const len = bytes.length

	// Szukamy sygnatury EOCD (PK\x05\x06) od końca pliku.
	let eocd = -1
	const min = Math.max(0, len - 22 - 65535)
	for (let i = len - 22; i >= min; i--) {
		if (view.getUint32(i, true) === 0x06054b50) {
			eocd = i
			break
		}
	}
	if (eocd < 0) throw new Error("Nieprawidłowe archiwum (brak EOCD) — to nie wygląda na .docx.")

	const count = view.getUint16(eocd + 10, true)
	let cd = view.getUint32(eocd + 16, true)

	for (let i = 0; i < count; i++) {
		if (view.getUint32(cd, true) !== 0x02014b50) break
		const method = view.getUint16(cd + 10, true)
		const compSize = view.getUint32(cd + 20, true)
		const nameLen = view.getUint16(cd + 28, true)
		const extraLen = view.getUint16(cd + 30, true)
		const commentLen = view.getUint16(cd + 32, true)
		const localOff = view.getUint32(cd + 42, true)
		const name = new TextDecoder().decode(bytes.subarray(cd + 46, cd + 46 + nameLen))

		if (name === target) {
			// Rozmiary w nagłówku lokalnym bywają zerowe (data descriptor) — używamy danych z centralnego katalogu.
			const lhNameLen = view.getUint16(localOff + 26, true)
			const lhExtraLen = view.getUint16(localOff + 28, true)
			const dataStart = localOff + 30 + lhNameLen + lhExtraLen
			const comp = bytes.subarray(dataStart, dataStart + compSize)
			let raw: Uint8Array
			if (method === 0) raw = comp
			else if (method === 8) raw = await inflateRaw(comp)
			else throw new Error(`Nieobsługiwana metoda kompresji (${method}) w .docx.`)
			return new TextDecoder("utf-8").decode(raw)
		}

		cd += 46 + nameLen + extraLen + commentLen
	}
	return null
}

/** Wczytuje plik .docx (w przeglądarce) i zwraca jego tekst. */
export async function readDocxFile(file: File): Promise<string> {
	const buf = await file.arrayBuffer()
	const xml = await readZipEntry(buf, "word/document.xml")
	if (xml === null) {
		throw new Error("To nie wygląda na poprawny .docx (brak word/document.xml).")
	}
	return documentXmlToText(xml)
}
