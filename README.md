# Hoe kan het gebruik van gezichtsherkenningstechnologie bijdragen aan de ontwikkeling van gepersonaliseerde videos voor evenementbezoekers?

## Overzicht
Dit project implementeert een geautomatiseerd systeem voor het maken van gepersonaliseerde aftermovies van evenementen met behulp van gezichtsherkenning. Gebouwd met de T3 stack (TypeScript, Tailwind, tRPC) en AWS Rekognition, analyseert de applicatie evenementvideo's om bezoekers te identificeren en gepersonaliseerde videoinhoud te genereren.

## Functionaliteiten
- Gezichtsherkenning in videobeelden via AWS Rekognition
- Geautomatiseerde videoverwerking en personalisatie
- Gebruiksvriendelijke interface voor evenementorganisatoren en bezoekers
- Veilige verwerking van gezichtsherkenningsgegevens
- TypeScript-gebaseerde implementatie voor robuuste type-veiligheid

## Technische Stack
- **Frontend**: Next.js met TypeScript
- **Styling**: Tailwind CSS
- **Backend**: tRPC
- **Cloud Services**: AWS Rekognition

## Vereisten
- Node.js
- AWS Account met Rekognition toegang

## Installatie
1. Clone de repository
```bash
git clone https://github.com/GillesVanCleemput/bachproef_rekognition.git
```

2. Installeer dependencies
```bash
npm install
```

3. Configureer omgevingsvariabelen
```bash
cp .env.example .env
```
Vul de volgende AWS inloggegevens en omgevingsvariabelen in je .env bestand in:

AWS_REGION=""
AWS_REGION_TRANSCODE=""
AWS_BUCKET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_SNS_TOPIC_ARN=""
AWS_REKOGNITION_ROLE_ARN=""
AWS_TRANSCODER_PIPELINE_ID=""
AWS_TRANSCODER_PRESET_ID=""

4. Start de development server
```bash
npm run dev
```


## Over dit Project
Dit project is ontwikkeld als bachelorproef aan de HoGent (2024-2025) door Gilles Van Cleemput. Het onderzoekt hoe gezichtsherkenningstehnologie kan bijdragen aan de ontwikkeling van gepersonaliseerde video's voor evenementbezoekers.

## Begeleiding
- Promotor: Mevr. K. Samyn
- Co-promotor: Dhr W. Himpe
