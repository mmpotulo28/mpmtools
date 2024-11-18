import React, { useState } from "react";
import Image from "next/image";
import styles from "./styles.module.css";

interface ImageData {
	file: File;
	newName: string;
	newURL: string;
	progress: number;
	dimensions: { width: number; height: number };
}

const ImageNameReWrite: React.FC = () => {
	const [images, setImages] = useState<ImageData[]>([]);
	const [keepOriginalSize, setKeepOriginalSize] = useState(false);
	const [imageType, setImageType] = useState("original");

	const handleImageTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setImageType(event.target.value);
	};

	const handleKeepOriginalSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setKeepOriginalSize(event.target.checked);
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const fileArray = Array.from(files);
			const newImages = fileArray.map((file) => {
				const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
				return {
					file,
					newName: nameWithoutExtension.replace(/[^a-zA-Z0-9]+/g, "_"),
					newURL: URL.createObjectURL(file),
					progress: 0,
					dimensions: { width: 0, height: 0 },
				};
			});

			const dimensionsPromises = newImages.map((image) => {
				return new Promise<{ width: number; height: number }>((resolve) => {
					const img = new window.Image();
					img.onload = () => {
						resolve({ width: img.width, height: img.height });
					};
					img.src = image.newURL;
				});
			});

			Promise.all(dimensionsPromises).then((dimensions) => {
				const updatedImages = newImages.map((image, index) => ({
					...image,
					dimensions: dimensions[index],
				}));
				setImages(updatedImages);
			});
		}
	};

	const handleSaveAsJpeg = (index: number) => {
		const image = images[index];
		if (image) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			const img = new window.Image();

			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx?.drawImage(img, 0, 0);
				canvas.toBlob(async (blob) => {
					if (blob) {
						const newImgURL = URL.createObjectURL(blob);
						setImages((prev) => {
							const newImages = [...prev];
							newImages[index] = {
								...newImages[index],
								newURL: newImgURL,
								progress: 100,
							};
							return newImages;
						});

						try {
							// @ts-expect-error: showDirectoryPicker is not yet supported in TypeScript
							const handle = await window.showDirectoryPicker();
							const fileHandle = await handle.getFileHandle(`${image.newName}.jpeg`, {
								create: true,
							});
							const writable = await fileHandle.createWritable();
							await writable.write(blob);
							await writable.close();
						} catch (error) {
							console.error("Error saving file:", error);
						}
					}
				}, "image/jpeg");

				setImages((prev) => {
					const newImages = [...prev];
					newImages[index] = {
						...newImages[index],
						progress: 50,
					};
					return newImages;
				});
			};

			img.src = image.newURL;
		}
	};

	const handleSaveAllAsJpeg = () => {
		images.forEach((_, index) => handleSaveAsJpeg(index));
	};

	const handleReset = () => {
		setImages([]);
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
				{images.length > 0 && (
					<div className={styles.output}>
						{images.map((image, index) => (
							<div key={index} className={styles.image}>
								<div>
									<h1>New Details</h1>
									<p>New Name: {image.newName}</p>
									<p>Size: {(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
									<p>
										Resolution: {image.dimensions.width} x{" "}
										{image.dimensions.height}
									</p>
								</div>

								<div className="">
									{image.newURL && (
										<Image
											src={image.newURL}
											alt={image.newName}
											layout="intrinsic"
											width={image.dimensions.width || 100}
											height={image.dimensions.height || 100}
										/>
									)}
								</div>
								<div className={styles.controls}>
									<button onClick={() => handleSaveAsJpeg(index)}>
										Save as JPEG
									</button>
									<progress value={image.progress} max="100"></progress>
								</div>
							</div>
						))}

						<div className={styles.controlsInline}>
							<button onClick={handleSaveAllAsJpeg}>Save All as JPEG</button>
							<button onClick={handleReset}>Reset</button>
						</div>
					</div>
				)}
			</div>

			{/* Image Options */}
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
			</div>
		</div>
	);
};

export default ImageNameReWrite;
