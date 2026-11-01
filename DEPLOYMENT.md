# Xin Shu website

Production: https://xinshu.info/
Repository: Mr-Sushi/Mr-Sushi.github.io

`main` contains the static GitHub Pages build. `website-source` contains the editable React/Vite source. `backup/pre-rooms-2026-11-01` preserves the previous website.

Use Node 22, run `npm ci` and `npm run build` on the source branch. Publish the contents of `dist/` to main while keeping CNAME and .nojekyll. The build creates direct-entry pages for CV, projects, rooms and all albums, plus redirects from the old HTML URLs.

The PDF download is the owner-provided CV_AIED.pdf. Photos and personal content are supplied or approved by the owner. Room UI stays English; the flat pages offer English and Chinese.
