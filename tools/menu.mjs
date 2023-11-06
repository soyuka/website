import { parse } from 'yaml'
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'fs'
import matter from 'gray-matter';

function slugify(text) {
  return text
    .toString()                           // Cast to string (optional)
    .normalize('NFKD')            // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase()                  // Convert the string to lowercase letters
    .trim()                                  // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
}

function extractTitleFromMarkdown(content) {
  const lines = content.split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const result = line.match(/#\s(.*)/);

    if (null === result || result.length === 0) {
      continue;
    }

    return result[1];
  }

  return null;
}

let menu = ``

const versions = readFileSync('./docs-versions.txt', {encoding: 'utf8'}).split('\n').map((v) => v.trim()).filter(v => v)

versions.forEach((version) => {
  const file = readFileSync(`./content/${version}/outline.yaml`, {encoding: 'utf8'})
  const data = parse(file)
  const menuVersion = version.replace('.', '')

  data.chapters.forEach((e, i) => {
    const parentId = slugify(e.title)
    menu += `[[${menuVersion}]]
    name = "${e.title}"
    identifier = "${parentId}"
    pageRef = '/${version}/${e.path}'
    weight = ${i + 1}
`
    const parent = e;
    e.items.forEach((f, j) => {
      let filename = f
      let path = `/${version}/${parent.path}/${f}`
      if (f === 'index') {
        filename = '_index'
        path = `/${version}/${parent.path}`
      }

      const title = extractTitleFromMarkdown(readFileSync(`./content/${version}/${parent.path}/${filename}.md`, {encoding: 'utf8'}).toString())
    menu += `[[${menuVersion}]]
    name = "${title}"
    identifier = "${parentId}-${slugify(title)}"
    pageRef = '${path}'
    url = '${path}'
    weight = ${j+1}
    parent = '${parentId}'
`
    })
  })

  menu += `[[${menuVersion}]]
    name = "API Reference"
    url = '/reference/${version}'
    weight = 3
`

  if (existsSync(`./content/guides/${version}`)) {
  menu += `[[${menuVersion}]]
    name = "Guides"
    url = '/guides/${version}'
    weight = 3
`

    const guides = readdirSync(`./content/guides/${version}`)
    guides.forEach((guide) => {
      const {data} =  matter(readFileSync(`./content/guides/${version}/${guide}`, {encoding: 'utf8'}).toString())
      menu += `[[${menuVersion}]]
    name = "${data.name}"
    parent = "Guides"
    pageRef = "/guides/${version}/${guide}"
    url = "/guides/${version}/${data.slug}"
    weight = "${data.position}"
`
    })
  }

  menu += `[[${menuVersion}]]
    name = "Changelog"
    url = '/changelog/${version}'
`

  menu += `[[${menuVersion}]]
    name = "Versions"
`

  versions.forEach((version) => {
    menu += `[[${menuVersion}]]
    name = "${version}"
    url = '/${version}/distribution'
    weight = ${version === 'main' ? 0 : version.replace('.', '')}
    parent = "Versions"
`

  })
})

writeFileSync('config/_default/menus.toml', menu)
