import {GlobalFonts, createCanvas, loadImage} from '@napi-rs/canvas';
import {drawText} from 'canvas-txt';
import desm from 'desm';
import path from 'path';

export const generateMenfessFrame = async (username: string, text: string): Promise<Buffer> => {
	GlobalFonts.registerFromPath(
		path.resolve(desm(import.meta.url), '..', 'resources', 'fonts', 'Montserrat-Bold.ttf'), 'MBold',
	);

	GlobalFonts.registerFromPath(
		path.resolve(desm(import.meta.url), '..', 'resources', 'fonts', 'Montserrat-Regular.ttf'), 'MRegular',
	);
	const canvas = createCanvas(1080, 1080);
	const ctx = canvas.getContext('2d');

	const backgroundFrame = await loadImage(path.resolve(desm(import.meta.url), '..', 'resources', 'menfess_frame.png'));

	ctx.drawImage(backgroundFrame, 0, 0);

	ctx.fillStyle = '#ffffff';
	drawText(ctx as unknown as CanvasRenderingContext2D, '@' + username, {
		x: 220,
		y: 115,
		fontSize: 46,
		font: 'MBold',
		fontStyle: 'black',
		width: 630,
		height: 200,
	});

	ctx.fillStyle = '#000000';
	drawText(ctx as unknown as CanvasRenderingContext2D, text, {
		x: 115,
		y: (canvas.height / 2) - 200,
		fontSize: 40,
		font: 'MBold',
		fontStyle: 'black',
		width: 850,
		height: 620,
	});

	return canvas.toBuffer('image/jpeg');
};
