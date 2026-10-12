# Veillée — version test avec IA

Ce dossier contient tout pour mettre en ligne une version testable, où le Veilleur, le Passeur et les caricatures utilisent une vraie IA.

- `public/index.html` : la page Veillée
- `netlify/functions/ai.js` : le petit serveur qui parle à l'IA (ta clé secrète reste ici, jamais dans la page)
- `netlify.toml` : la configuration

## Mise en ligne (environ 25 minutes, sans coder)

### 1. Obtenir une clé d'IA
1. Crée un compte sur **console.anthropic.com**.
2. Ajoute un petit crédit (10 $ suffisent pour un test) et **fixe une limite de dépense mensuelle** dans les réglages de facturation.
3. Crée une **clé d'API** et copie-la dans un endroit privé. Ne la partage jamais.

### 2. Mettre les fichiers sur GitHub
1. Crée un compte gratuit sur **github.com**.
2. Crée un nouveau dépôt (« New repository »), nom au choix, en **privé**.
3. Clique « uploading an existing file » et **glisse les 3 éléments** de ce dossier : `public`, `netlify` et `netlify.toml` (pas le fichier zip lui-même). Confirme avec « Commit changes ».

### 3. Publier avec Netlify
1. Crée un compte gratuit sur **netlify.com** (connecte-toi avec GitHub).
2. « Add new project » puis « Import an existing project » et choisis ton dépôt.
3. Avant de publier, ajoute ces **variables d'environnement** :
   - `ANTHROPIC_API_KEY` : ta clé de l'étape 1
   - `ACCESS_CODE` : un code d'invitation de ton choix (ex. `veillee-oct`)
4. Clique « Deploy ». Au bout de quelques minutes, tu reçois un lien.

(Les libellés des boutons peuvent changer un peu : les étapes restent les mêmes.)

### 4. Tester
Ouvre le lien, entre une date de naissance de plus de 18 ans et ton code d'invitation. Essaie une lanterne gentille, une floue, et une agressive.

## Sécurité et responsabilité
- Donne le lien et le code **seulement à des adultes** que tu connais.
- Préviens tes testeurs : leurs textes sont envoyés à un service d'IA pour la modération (Loi 25). Rien n'est sauvegardé par la page.
- Si le code fuit, change `ACCESS_CODE` dans Netlify et redéploie. Si la clé fuit, supprime-la dans la console et recrées-en une.
- Garde ta limite de dépense : c'est ton filet de sécurité.
- Chaque personne voit son propre lac : les lanternes ne sont pas partagées entre testeurs (étape suivante : une base de données).

## Si la modération IA ne répond pas
La page affiche un message d'erreur et ne publie rien. Cause probable : clé invalide, crédit épuisé ou mauvais code.
