import Head from "next/head";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import Link from "next/link";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export default function Home() {
	return (
		<>
			<Head>
				<title>MPM Tools | Image | Video | Check me out</title>
				<meta
					name="description"
					content="digital tools for developers by Manelisi Mpotulo"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
				<main className={styles.main}>
					<Link href={"./image"} className={styles.tool}>
						Image Optimization
					</Link>
				</main>
				<footer className={styles.footer}>
					<span>still in development</span>
				</footer>
			</div>
		</>
	);
}
