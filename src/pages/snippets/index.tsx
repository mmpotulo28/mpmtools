import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

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
		`const add = (a, b) => a + b;`,
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
							style={docco}
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