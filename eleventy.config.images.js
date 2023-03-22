const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");

/*
===== metadata =====
{
  avif: [
    {
      format: 'avif',
      width: 600,
      height: 450,
      url: '/img/LxhKcw7pLy-600.avif',
      sourceType: 'image/avif',
      srcset: '/img/LxhKcw7pLy-600.avif 600w',
      filename: 'LxhKcw7pLy-600.avif',
      outputPath: '_site/img/LxhKcw7pLy-600.avif',
      size: 22113
    },
    {
      format: 'avif',
      width: 1200,
      height: 900,
      url: '/img/LxhKcw7pLy-1200.avif',
      sourceType: 'image/avif',
      srcset: '/img/LxhKcw7pLy-1200.avif 1200w',
      filename: 'LxhKcw7pLy-1200.avif',
      outputPath: '_site/img/LxhKcw7pLy-1200.avif',
      size: 69531
    }
  ],
  webp: [
    {
      format: 'webp',
      width: 600,
      height: 450,
      url: '/img/LxhKcw7pLy-600.webp',
      sourceType: 'image/webp',
      srcset: '/img/LxhKcw7pLy-600.webp 600w',
      filename: 'LxhKcw7pLy-600.webp',
      outputPath: '_site/img/LxhKcw7pLy-600.webp',
      size: 38274
    },
    {
      format: 'webp',
      width: 1200,
      height: 900,
      url: '/img/LxhKcw7pLy-1200.webp',
      sourceType: 'image/webp',
      srcset: '/img/LxhKcw7pLy-1200.webp 1200w',
      filename: 'LxhKcw7pLy-1200.webp',
      outputPath: '_site/img/LxhKcw7pLy-1200.webp',
      size: 123598
    }
  ],
  jpeg: [
    {
      format: 'jpeg',
      width: 600,
      height: 450,
      url: '/img/LxhKcw7pLy-600.jpeg',
      sourceType: 'image/jpeg',
      srcset: '/img/LxhKcw7pLy-600.jpeg 600w',
      filename: 'LxhKcw7pLy-600.jpeg',
      outputPath: '_site/img/LxhKcw7pLy-600.jpeg',
      size: 50727
    },
    {
      format: 'jpeg',
      width: 1200,
      height: 900,
      url: '/img/LxhKcw7pLy-1200.jpeg',
      sourceType: 'image/jpeg',
      srcset: '/img/LxhKcw7pLy-1200.jpeg 1200w',
      filename: 'LxhKcw7pLy-1200.jpeg',
      outputPath: '_site/img/LxhKcw7pLy-1200.jpeg',
      size: 171767
    }
  ]
}
===== imageAttributes =====
{
  alt: 'some bread',
  sizes: [ '(min-width: 600px) 600w', '300w' ],
  loading: 'lazy',
  decoding: 'async'
}
*/

function mapSizeToDensity() {

}

function generateHTML(_metadata, _imageAttributes) {
	// widths to target: 500px (1x), 1000px (2x), 1500px (3x)
	// formats: avif, webp
	// need to create my own srcset attribute and use density multipliers instead of widths
	const metadata = {..._metadata}
	const imageAttributes = {..._imageAttributes}
	const formats = Object.keys(metadata)
	const defaultFormat = formats[formats.length - 1]
	let lowSrc = metadata[defaultFormat][0]
	let highSrc = metadata[defaultFormat][metadata[defaultFormat].length - 1]
	// programmatically set a "portrait" or "landscape" class
	// use class to set appropriate height
	let orientationClass = highSrc.width / highSrc.height > 1 ? "landscape" : "portrait"
	return `<picture>
	${Object.values(metadata).map(imageFormat => {
		return `<source type="${imageFormat[0].sourceType}" srcset="">`
	})}
	</picture>`
}

module.exports = eleventyConfig => {
	function relativeToInputPath(inputPath, relativeFilePath) {
		let split = inputPath.split("/");
		split.pop();

		return path.resolve(split.join(path.sep), relativeFilePath);
	}


	// Eleventy Image shortcode
	// https://www.11ty.dev/docs/plugins/image/
	// eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, widths, sizes) {
		eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt) {

		// Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
		// Warning: Avif can be resource-intensive so take care!
		let formats = ["avif", "webp"];
		let file = relativeToInputPath(this.page.inputPath, src);
		let metadata = await eleventyImage(file, {
			widths: [1000],
			densities: ["1x", "2x", "3x"],
			formats,
			outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
		});

		// TODO loading=eager and fetchpriority=high
		let imageAttributes = {
			alt,
			loading: "lazy",
			decoding: "async",
		};
		console.log("===== metadata =====")
		console.log(metadata)
		console.log("===== imageAttributes =====")
		console.log(imageAttributes)
		// return eleventyImage.generateHTML(metadata, imageAttributes);
		const defaultFormat = formats[formats.length - 1]
		let lowSrc = metadata[defaultFormat][0]
		let highSrc = metadata[defaultFormat][metadata[defaultFormat].length - 1]
		// programmatically set a "portrait" or "landscape" class
		// use class to set appropriate height
		let orientationClass = highSrc.width / highSrc.height > 1 ? "landscape" : "portrait"
		return `<picture>
		${Object.values(metadata).map(imageFormat => {
		  return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="1000px">`;
		}).join("\n")}
		  <img
		  class="${orientationClass}"
			src="${lowSrc.url}"
			alt="${alt}"
			arbitrary="value"
			loading="lazy"
			decoding="async"
			width="600px">
		</picture>`;
	});
};
