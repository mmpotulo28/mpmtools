import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./styles.module.css";

interface ImageData {
	file: File;
	name: string;
	type: string;
	size: number;
	url: string;
	dimensions: { width: number; height: number };
}

const ImageNameReWrite: React.FC = () => {
	const [images, setImages] = useState<ImageData[]>([]);
	const [originalImages, setOriginalImages] = useState<ImageData[]>([]);
	const [keepOriginalSize, setKeepOriginalSize] = useState(false);
	const [imageType, setImageType] = useState("original");
	const [aspectRatio, setAspectRatio] = useState("original");
	const [imageExtension, setImageExtension] = useState("jpeg");

	const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const fileArray = Array.from(files);
			const originals = fileArray.map((file) => ({
				file,
				name: file.name,
				type: file.type,
				size: file.size,
				url: URL.createObjectURL(file),
				dimensions: { width: 0, height: 0 },
			}));

			const dimensionsPromises = originals.map((image) => {
				return new Promise<{ width: number; height: number }>((resolve) => {
					const img = new window.Image();
					img.onload = () => resolve({ width: img.width, height: img.height });
					img.src = image.url;
				});
			});

			Promise.all(dimensionsPromises).then((dimensions) => {
				const updatedImages = originals.map((image, index) => ({
					...image,
					dimensions: dimensions[index],
				}));
				setOriginalImages(updatedImages);
			});
		}
	}, []);

	const convertImages = useCallback(
		(images: ImageData[]) => {
			images.forEach((image, index) => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				const img = new window.Image();

				img.onload = () => {
					const { width, height } = img;
					let cropWidth = width;
					let cropHeight = height;
					let offsetX = 0;
					let offsetY = 0;

					if (aspectRatio !== "original") {
						const [aspectWidth, aspectHeight] = aspectRatio.split(":").map(Number);
						if (aspectWidth && aspectHeight) {
							const aspectRatioValue = aspectWidth / aspectHeight;
							if (width / height > aspectRatioValue) {
								cropWidth = height * aspectRatioValue;
								offsetX = (width - cropWidth) / 2;
							} else {
								cropHeight = width / aspectRatioValue;
								offsetY = (height - cropHeight) / 2;
							}
						}
					}

					canvas.width = cropWidth;
					canvas.height = cropHeight;
					ctx?.drawImage(
						img,
						offsetX,
						offsetY,
						cropWidth,
						cropHeight,
						0,
						0,
						cropWidth,
						cropHeight,
					);
					canvas.toBlob((blob) => {
						if (blob) {
							const newImgURL = URL.createObjectURL(blob);
							setImages((prev) => {
								const newImages = [...prev];
								newImages[index] = {
									...newImages[index],
									name: `${image.name
										.replace(/\.[^/.]+$/, "")
										.replace(/%20/g, "_")
										.replace(/[^a-z0-9_]/gi, "_")
										.toLowerCase()}`,
									file: image.file,
									url: newImgURL,
									dimensions: { width: cropWidth, height: cropHeight },
								};
								return newImages;
							});
						}
					}, `image/${imageExtension}`);
				};

				img.src = image.url;
			});
		},
		[aspectRatio, imageExtension],
	);

	useEffect(() => {
		if (originalImages.length > 0) {
			convertImages(originalImages);
		}
	}, [imageExtension, aspectRatio, convertImages, originalImages]);

	const handleSaveAsImage = async (index: number) => {
		const image = images[index];
		if (image && image.url) {
			try {
				const response = await fetch(image.url);
				const blob = await response.blob();

				// @ts-expect-error: showDirectoryPicker is not yet supported in TypeScript
				const handle = await window.showDirectoryPicker();
				const fileHandle = await handle.getFileHandle(`${image.name}.${imageExtension}`, {
					create: true,
				});
				const writable = await fileHandle.createWritable();
				await writable.write(blob);
				await writable.close();
			} catch (error) {
				console.error("Error saving file:", error);
			}
		}
	};

	const handleSaveAllAsImage = async () => {
		for (let index = 0; index < images.length; index++) {
			await handleSaveAsImage(index);
		}
	};

	const handleReset = () => {
		setImages([]);
		setOriginalImages([]);
		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const formatFileSize = (size: number) => {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
		if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
		return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.container}>
				<div
					className={styles.dropzone}
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						e.preventDefault();
						handleImageUpload({
							target: { files: e.dataTransfer.files },
						} as React.ChangeEvent<HTMLInputElement>);
					}}>
					Drag and drop images here, or click to select files
					<input
						type="file"
						accept="image/png, image/jpeg"
						multiple
						onChange={handleImageUpload}
					/>
				</div>
				{originalImages.length > 0 && (
					<div className={styles.output}>
						{originalImages.map((image, index) => (
							<div key={index} className={styles.image}>
								<div>
									<h3>Original Details</h3>
									<p>Name: {image.name}</p>
									<p>Size: {formatFileSize(image.file.size)}</p>
									<p>
										Resolution: {image.dimensions.width} x{" "}
										{image.dimensions.height}
									</p>

									<br />

									<h3>Converted Details</h3>
									{images[index] && (
										<>
											<p>New Name: {images[index].name}</p>
											<p>Size: {formatFileSize(images[index].file.size)}</p>
											<p>
												Resolution: {images[index].dimensions.width} x{" "}
												{images[index].dimensions.height}
											</p>
										</>
									)}

									<br />
									<br />
									<div className={styles.controls}>
										<button onClick={() => handleSaveAsImage(index)}>
											Save as {imageExtension.toUpperCase()}
										</button>
									</div>
								</div>
								<div className={styles.imageContainer}>
									{image.url && (
										<Image
											src={image.url}
											alt={image.name}
											objectFit="contain"
											width={image.dimensions?.width || 100}
											height={image.dimensions?.height || 100}
											className={styles.imagePreview}
										/>
									)}
								</div>
							</div>
						))}
						<div className={styles.controlsInline}>
							<button onClick={handleSaveAllAsImage}>
								Save All as {imageExtension.toUpperCase()}
							</button>
							<button onClick={handleReset}>Reset</button>
						</div>
					</div>
				)}
			</div>
			<div className={styles.imageOptions}>
				<h2>Image Options</h2>
				<div>
					<label>
						<input
							type="checkbox"
							checked={keepOriginalSize}
							onChange={(e) => setKeepOriginalSize(e.target.checked)}
						/>
						Keep Original Size
					</label>
				</div>
				<div>
					<label>
						Image Type:
						<select value={imageType} onChange={(e) => setImageType(e.target.value)}>
							<option value="original">Original</option>
							<option value="card">Card Image</option>
							<option value="banner">Banner Image</option>
						</select>
					</label>
				</div>
				<div>
					<label>
						Aspect Ratio:
						<select
							value={aspectRatio}
							onChange={(e) => setAspectRatio(e.target.value)}>
							<option value="original">Original</option>
							<option value="16:9">16:9</option>
							<option value="4:3">4:3</option>
							<option value="1:1">1:1</option>
						</select>
					</label>
				</div>
				<div>
					<label>
						Image Extension:
						<select
							value={imageExtension}
							onChange={(e) => setImageExtension(e.target.value)}>
							<option value="jpeg">JPEG</option>
							<option value="png">PNG</option>
						</select>
					</label>
				</div>
			</div>
		</div>
	);
};

export default ImageNameReWrite;
