const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export class Utils {
	static getBase62String(number: number) {
		let result = "";
		while (number > 0) {
			result = BASE62_CHARS[number % 62] + result;
			number = Math.floor(number / 62);
		}
		return result;
	}
}
