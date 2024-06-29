// Anything that doesn't interact with the dom

/**
 * @param {string} theme
 */
const setCurrentTheme = theme => {
	chrome.storage.local.set({ theme }).then(() => {
		console.log("Theme set successfully")
	})
}

/**
 * Get the current theme from storage
 * @returns {string} theme
 */

const getCurrentTheme = async () => {
	let theme
	await chrome.storage.local.get(["theme"]).then(result => {
		theme = result.theme
	})

	return theme
}

/**
 * @param {string} theme
 */
const setCryptoRates = data => {
	chrome.storage.local
		.set({ "crypto-rates": JSON.stringify(data) })
		.then(() => {
			console.log("[crypto-rates-storage]", "Set successfully")
		})
}

/**
 * Get the current theme from storage
 * @returns {string} theme
 */

const getCryptoRates = async () => {
	let data = {}
	await chrome.storage.local.get(["crypto-rates"]).then(result => {
		const hasResult = Object.keys(result).length > 0
		if (hasResult) {
			data = JSON.parse(result["crypto-rates"])
			console.info("[crypto-rates-storage]", "Fetched successfully")
		}
	})

	return data
}

/**
 * @param {Date} date
 * @returns {string} date in form: Monday, March 18, 2024 at 1:01:53 AM GMT+1
 */
const formatDate = date => {
	const dateInstance = new Date(date)
	const dateString = dateInstance.toLocaleString("en-US", {
		dateStyle: "full",
	})
	const timeString = dateInstance.toLocaleTimeString([], {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	})

	return dateString + " AT " + timeString
}

/**
 * @example
 * // returns 68,233.0
 * formatAmount('68233.0')
 * @example
 * // returns 6823.00
 * formatAmount('6823.00')
 *
 * @param {string} amount
 * @returns {string}
 *
 */
const formatAmount = amount => {
	const amountSides = amount.split(".")
	const wholeNumberString = amountSides[0]
	const decimalNumbers = amountSides[1] ?? "00"

	const formattedWholeNumber = Number(wholeNumberString).toLocaleString()

	const formattedAmount = `${formattedWholeNumber}.${decimalNumbers}`

	return formattedAmount
}

const clearStorage = async () => {
	await chrome.storage.local.clear()
}

const fetchCryptoInfo = async () => {
	let cryptoInfo = []
	await fetch(CRYPTO_INFO_URL)
		.then(res => res.json())
		.then(data => {
			cryptoInfo = data
		})

	return cryptoInfo
}

const newLine = "%0A"
const tweetRates = async () => {
	const cryptoInfo = await fetchCryptoInfo()
	const supportedCrypto = cryptoInfo.filter(
		crypto => crypto["canTweet"] === "true"
	)
	const ratesInStorage = await getCryptoRates()

	const { rates, last_updated } = ratesInStorage
	let text = "🤖 Daily Crypto Rates"
	text += newLine
	text += formatDate(last_updated)
	text += newLine
	supportedCrypto.forEach(crypto => {
		const { code } = crypto
		const price = formatAmount(rates[code])
		text += `💰 ${code.toUpperCase()} $${price}${newLine}`
	})

	window.open(
		`https://twitter.com/intent/tweet?text=${text}&via=QuidaxGlobal`,
		"popup",
		"width=600,height=600"
	)
}
