import type { PartOfSpeech, VocabularyEntry, WordCategory } from './types.ts';

type Row = [de: string, et: string, partOfSpeech: PartOfSpeech];

export const categoryLabels: Record<WordCategory, { et: string; de: string }> = {
  tervitused: { et: 'Tervitused', de: 'Begrüßung' },
  inimesed: { et: 'Inimesed', de: 'Menschen' },
  kodu: { et: 'Kodu', de: 'Zuhause' },
  toit: { et: 'Toit ja jook', de: 'Essen & Trinken' },
  ostlemine: { et: 'Ostlemine', de: 'Einkaufen' },
  aeg: { et: 'Aeg', de: 'Zeit' },
  liiklus: { et: 'Liiklus ja reis', de: 'Verkehr & Reise' },
  oppimine: { et: 'Töö ja õppimine', de: 'Arbeit & Lernen' },
  tervis: { et: 'Tervis', de: 'Gesundheit' },
  'riided-ilm': { et: 'Riided ja ilm', de: 'Kleidung & Wetter' },
};

const groups: Record<WordCategory, Row[]> = {
  tervitused: [
    ['Hallo', 'tere', 'phrase'], ['Guten Morgen', 'tere hommikust', 'phrase'], ['Guten Tag', 'tere päevast', 'phrase'], ['Guten Abend', 'tere õhtust', 'phrase'],
    ['Gute Nacht', 'head ööd', 'phrase'], ['Auf Wiedersehen', 'nägemist', 'phrase'], ['Bis bald', 'näeme varsti', 'phrase'], ['Willkommen', 'tere tulemast', 'phrase'],
    ['Bitte', 'palun', 'phrase'], ['Danke', 'aitäh', 'phrase'], ['Ja', 'jah', 'other'], ['Nein', 'ei', 'other'],
    ['Entschuldigung', 'vabandust', 'phrase'], ['Es tut mir leid', 'mul on kahju', 'phrase'], ['Wie?', 'kuidas?', 'adverb'], ['Wer?', 'kes?', 'other'],
    ['Was?', 'mis?', 'other'], ['Wo?', 'kus?', 'adverb'], ['Wann?', 'millal?', 'adverb'], ['Vielleicht', 'võib-olla', 'adverb'],
  ],
  inimesed: [
    ['der Mensch', 'inimene', 'noun'], ['die Frau', 'naine', 'noun'], ['der Mann', 'mees', 'noun'], ['das Kind', 'laps', 'noun'],
    ['die Familie', 'perekond', 'noun'], ['die Mutter', 'ema', 'noun'], ['der Vater', 'isa', 'noun'], ['die Tochter', 'tütar', 'noun'],
    ['der Sohn', 'poeg', 'noun'], ['der Freund', 'meessoost sõber', 'noun'], ['die Freundin', 'naissoost sõber', 'noun'], ['der Name', 'nimi', 'noun'],
    ['der Nachbar', 'naaber', 'noun'], ['die Kollegin', 'naiskolleeg', 'noun'], ['der Arzt', 'arst', 'noun'], ['die Lehrerin', 'õpetaja', 'noun'],
    ['der Kunde', 'klient', 'noun'], ['der Gast', 'külaline', 'noun'], ['die Eltern', 'vanemad', 'noun'], ['die Großeltern', 'vanavanemad', 'noun'],
  ],
  kodu: [
    ['das Haus', 'maja', 'noun'], ['die Wohnung', 'korter', 'noun'], ['das Zimmer', 'tuba', 'noun'], ['die Küche', 'köök', 'noun'],
    ['das Badezimmer', 'vannituba', 'noun'], ['das Schlafzimmer', 'magamistuba', 'noun'], ['die Tür', 'uks', 'noun'], ['das Fenster', 'aken', 'noun'],
    ['der Tisch', 'laud', 'noun'], ['der Stuhl', 'tool', 'noun'], ['das Bett', 'voodi', 'noun'], ['die Lampe', 'lamp', 'noun'],
    ['der Schlüssel', 'võti', 'noun'], ['der Boden', 'põrand', 'noun'], ['die Wand', 'sein', 'noun'], ['der Garten', 'aed', 'noun'],
    ['der Kühlschrank', 'külmkapp', 'noun'], ['die Waschmaschine', 'pesumasin', 'noun'], ['die Dusche', 'dušš', 'noun'], ['die Toilette', 'tualett', 'noun'],
  ],
  toit: [
    ['das Brot', 'leib', 'noun'], ['die Milch', 'piim', 'noun'], ['das Wasser', 'vesi', 'noun'], ['der Kaffee', 'kohv', 'noun'],
    ['der Tee', 'tee', 'noun'], ['der Apfel', 'õun', 'noun'], ['die Banane', 'banaan', 'noun'], ['die Kartoffel', 'kartul', 'noun'],
    ['das Fleisch', 'liha', 'noun'], ['der Fisch', 'kala', 'noun'], ['das Ei', 'muna', 'noun'], ['der Käse', 'juust', 'noun'],
    ['die Butter', 'või', 'noun'], ['die Suppe', 'supp', 'noun'], ['der Salat', 'salat', 'noun'], ['das Frühstück', 'hommikusöök', 'noun'],
    ['das Mittagessen', 'lõunasöök', 'noun'], ['das Abendessen', 'õhtusöök', 'noun'], ['hungrig', 'näljane', 'adjective'], ['durstig', 'janune', 'adjective'],
  ],
  ostlemine: [
    ['das Geschäft', 'kauplus', 'noun'], ['der Markt', 'turg', 'noun'], ['der Preis', 'hind', 'noun'], ['das Geld', 'raha', 'noun'],
    ['der Euro', 'euro', 'noun'], ['die Karte', 'kaart', 'noun'], ['das Bargeld', 'sularaha', 'noun'], ['die Tüte', 'kott', 'noun'],
    ['der Kassenbon', 'kviitung', 'noun'], ['billig', 'odav', 'adjective'], ['teuer', 'kallis', 'adjective'], ['kaufen', 'ostma', 'verb'],
    ['bezahlen', 'maksma', 'verb'], ['brauchen', 'vajama', 'verb'], ['suchen', 'otsima', 'verb'], ['die Größe', 'suurus', 'noun'],
    ['das Angebot', 'pakkumine', 'noun'], ['geöffnet', 'avatud', 'adjective'], ['geschlossen', 'suletud', 'adjective'], ['die Umkleidekabine', 'proovikabiin', 'noun'],
  ],
  aeg: [
    ['heute', 'täna', 'adverb'], ['morgen', 'homme', 'adverb'], ['gestern', 'eile', 'adverb'], ['der Morgen', 'hommik', 'noun'],
    ['der Mittag', 'keskpäev', 'noun'], ['der Abend', 'õhtu', 'noun'], ['die Nacht', 'öö', 'noun'], ['der Tag', 'päev', 'noun'],
    ['die Woche', 'nädal', 'noun'], ['der Monat', 'kuu', 'noun'], ['das Jahr', 'aasta', 'noun'], ['die Stunde', 'tund', 'noun'],
    ['die Minute', 'minut', 'noun'], ['der Montag', 'esmaspäev', 'noun'], ['der Freitag', 'reede', 'noun'], ['das Wochenende', 'nädalavahetus', 'noun'],
    ['jetzt', 'praegu', 'adverb'], ['später', 'hiljem', 'adverb'], ['früh', 'vara', 'adverb'], ['spät', 'hilja', 'adverb'],
  ],
  liiklus: [
    ['das Auto', 'auto', 'noun'], ['der Bus', 'buss', 'noun'], ['der Zug', 'rong', 'noun'], ['das Fahrrad', 'jalgratas', 'noun'],
    ['die Haltestelle', 'peatus', 'noun'], ['der Bahnhof', 'raudteejaam', 'noun'], ['die Fahrkarte', 'sõidupilet', 'noun'], ['die Straße', 'tänav', 'noun'],
    ['der Weg', 'tee', 'noun'], ['die Stadt', 'linn', 'noun'], ['der Flughafen', 'lennujaam', 'noun'], ['reisen', 'reisima', 'verb'],
    ['fahren', 'sõitma', 'verb'], ['gehen', 'minema', 'verb'], ['kommen', 'tulema', 'verb'], ['abbiegen', 'ära pöörama', 'verb'],
    ['links', 'vasakul', 'adverb'], ['rechts', 'paremal', 'adverb'], ['geradeaus', 'otse', 'adverb'], ['die Ankunft', 'saabumine', 'noun'],
  ],
  oppimine: [
    ['die Arbeit', 'töö', 'noun'], ['der Beruf', 'elukutse', 'noun'], ['die Schule', 'kool', 'noun'], ['der Kurs', 'kursus', 'noun'],
    ['das Buch', 'raamat', 'noun'], ['das Wort', 'sõna', 'noun'], ['die Frage', 'küsimus', 'noun'], ['die Antwort', 'vastus', 'noun'],
    ['das Beispiel', 'näide', 'noun'], ['die Aufgabe', 'ülesanne', 'noun'], ['lernen', 'õppima', 'verb'], ['lesen', 'lugema', 'verb'],
    ['schreiben', 'kirjutama', 'verb'], ['sprechen', 'rääkima', 'verb'], ['verstehen', 'aru saama', 'verb'], ['wiederholen', 'kordama', 'verb'],
    ['anfangen', 'alustama', 'verb'], ['beenden', 'lõpetama', 'verb'], ['einfach', 'lihtne', 'adjective'], ['schwierig', 'raske', 'adjective'],
  ],
  tervis: [
    ['der Kopf', 'pea', 'noun'], ['die Hand', 'käsi', 'noun'], ['der Fuß', 'jalg', 'noun'], ['das Auge', 'silm', 'noun'],
    ['das Ohr', 'kõrv', 'noun'], ['der Mund', 'suu', 'noun'], ['der Bauch', 'kõht', 'noun'], ['der Rücken', 'selg', 'noun'],
    ['der Schmerz', 'valu', 'noun'], ['die Medizin', 'ravim', 'noun'], ['die Apotheke', 'apteek', 'noun'], ['das Krankenhaus', 'haigla', 'noun'],
    ['gesund', 'terve', 'adjective'], ['krank', 'haige', 'adjective'], ['müde', 'väsinud', 'adjective'], ['sich fühlen', 'end tundma', 'verb'],
    ['helfen', 'aitama', 'verb'], ['das Fieber', 'palavik', 'noun'], ['die Erkältung', 'külmetus', 'noun'], ['der Notfall', 'hädaolukord', 'noun'],
  ],
  'riided-ilm': [
    ['die Jacke', 'jope', 'noun'], ['das Hemd', 'särk', 'noun'], ['die Hose', 'püksid', 'noun'], ['das Kleid', 'kleit', 'noun'],
    ['der Schuh', 'king', 'noun'], ['die Socke', 'sokk', 'noun'], ['die Mütze', 'müts', 'noun'], ['der Mantel', 'mantel', 'noun'],
    ['das Wetter', 'ilm', 'noun'], ['die Sonne', 'päike', 'noun'], ['der Regen', 'vihm', 'noun'], ['der Schnee', 'lumi', 'noun'],
    ['der Wind', 'tuul', 'noun'], ['die Wolke', 'pilv', 'noun'], ['kalt', 'külm', 'adjective'], ['warm', 'soe', 'adjective'],
    ['heiß', 'kuum', 'adjective'], ['trocken', 'kuiv', 'adjective'], ['nass', 'märg', 'adjective'], ['der Regenschirm', 'vihmavari', 'noun'],
  ],
};

export const vocabulary: VocabularyEntry[] = (Object.entries(groups) as [WordCategory, Row[]][]).flatMap(([category, rows]) =>
  rows.map(([de, et, partOfSpeech], index) => ({ id: `${category}-${String(index + 1).padStart(2, '0')}`, de, et, category, partOfSpeech })),
);
