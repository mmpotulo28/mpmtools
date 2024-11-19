import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
// import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const SnippetManager: React.FC = () => {
	const snippets = [
		`
  const downloadImages = async (containerClassName) => {
	const container = document.querySelector(.{containerClassName}); //missing $ around containerClassName
	console.log("Container:", container);
	if (!container) {
		console.error("Container not found");
		return;
	}

	const images = container.querySelectorAll("img");
	console.log("Images:", images);
	for (let i = 0; i < images.length; i++) {
		const img = images[i];
		const imageUrl = img.src;
		const imageName = imageUrl.split("/").pop() || "default_image_name";

		const downloadLink = document.createElement("a");
		downloadLink.href = imageUrl;
		downloadLink.download = imageName;

		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);

		// Add a delay between each download
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
};

// Example usage:
downloadImages("mCSB_container");
  `,
		`
  (() => {
	const data = [];
	const elements = document.querySelectorAll(".slick-slide");

	elements.forEach((element, index) => {
		let videoSrc = element.getAttribute("data-videosrc");
		const imgElement = element.querySelector("img");
		const imgSrc = imgElement ? imgElement.src : null;
		const textElement = element.querySelector("p");
		const text = textElement ? textElement.innerText : null;

		// Convert embed URL to watch URL
		if (videoSrc && videoSrc.includes("youtube.com/embed/")) {
			videoSrc = videoSrc.replace("/embed/", "/watch?v=");
		}

		data.push({
			id: index + 1,
			title:
				text && text.split("\n")[0] ? text.split("\n")[0].replace(/[^\w\s-]/g, "") : null,
			description:
				text && text.split("\n")[1] ? text.split("\n")[1].replace(/[^\w\s-]/g, "") : null,
			entryName: text
				.replace(/\n/g, " ")
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, " "),
			videoUrl: videoSrc,
			imageUrl: imgSrc,
		});
	});

	console.log("Image Count:", data.length);
	console.log(JSON.stringify(data, null, 2));
})();
  `,
	];

	return (
		<div>
			<h1>Code Snippets</h1>
			<div>
				{snippets.map((snippet, index) => (
					<>
						<br />
						<h2>Code Snippet</h2>
						<SyntaxHighlighter
							key={index}
							language="javascript"
							style={dark}
							showLineNumbers
							useInlineStyles>
							{snippet}
						</SyntaxHighlighter>
					</>
				))}
			</div>
		</div>
	);
};

export default SnippetManager;
