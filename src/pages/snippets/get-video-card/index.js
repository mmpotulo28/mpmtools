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
