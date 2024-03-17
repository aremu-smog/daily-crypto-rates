const todaysDate = document.querySelector("#todays-date");
const todaysVerse = document.querySelector("#bible-verse");
const todaysBibleReference = document.querySelector("#bible-reference");

const mainWrapper = document.querySelector("body");

const playButton = document.querySelector("#play-button");
const playButtonLoader = document.querySelector("#play-button-loader");

const timerHour = document.querySelector("#hour");
const timerMinute = document.querySelector("#minute");
const lastUpdated = document.querySelector("#last-updated-date");

const cryptoRatesTable = document.querySelector("#crypto-rates-table");

CRYTPO_API_URL = "https://daily-crypto-rates.onrender.com";
CRYPTO_INFO_URL = "./data/currencies.json";
window.addEventListener("load", async (e) => {
  let last_updated;
  let crypto_rates;
  const cryptoRatesInStorage = await getCryptoRates();
  const cryptoInfo = await fetchCryptoInfo();
  last_updated = cryptoRatesInStorage.last_updated;
  crypto_rates = cryptoRatesInStorage.rates;

  lastUpdated.innerText = formatDate(last_updated);
  populateTable(cryptoInfo, crypto_rates);
  const cryptoRates = await fetchCryptoRates();

  const cryptoRatesFromServer = cryptoRates.rates;
  const hasData = Object.keys(cryptoRatesFromServer).length > 0;
  if (hasData) {
    last_updated = cryptoRates.last_updated;
    crypto_rates = cryptoRates.rates;
  }

  lastUpdated.innerText = formatDate(last_updated);
  populateTable(cryptoInfo, crypto_rates);
});

const fetchCryptoInfo = async () => {
  let cryptoInfo = [];
  await fetch(CRYPTO_INFO_URL)
    .then((res) => res.json())
    .then((data) => {
      cryptoInfo = data;
    });

  return cryptoInfo;
};

const populateTable = (cryptoInfo, cryptoPrices) => {
  cryptoRatesTable.innerHTML = "";
  const tableRows = cryptoInfo.map((crypto) => {
    const { name = "", code = "" } = crypto;
    const price = cryptoPrices[code];

    const row = document.createElement("tr");

    row.innerHTML = `
			<td>${name}</td>
			<td>${code.toUpperCase()}</td>
			<td>$ ${price}</td>
		`;
    cryptoRatesTable.append(row);
  });
};

const fetchCryptoRates = async () => {
  let cryptoData = {};
  try {
    const crypto_rates_query = await fetch(CRYTPO_API_URL);

    if (crypto_rates_query.status == 200) {
      data = await crypto_rates_query.json();
      const hasData = Object.keys(data.rates).length > 0;
      if (hasData) {
        await setCryptoRates(data);
        cryptoData = data;
      }
    }
  } catch (e) {
    console.warn("[crypto-api]", e.message);
  } finally {
    cryptoData = await getCryptoRates();
    return cryptoData;
  }
};

//   window.open(
//     `https://twitter.com/intent/tweet?text=${text}&via=aremu_smog`,
//     "popup",
//     "width=600,height=600"
//   );

const setTheme = async () => {
  const currentTheme = await getCurrentTheme();

  const isDarkMode = currentTheme === "dark";

  if (isDarkMode) {
    mainWrapper.classList.add("dark");
    themeToggleButton.innerText = "Light Mode";
  } else {
    mainWrapper.classList.remove("dark");
    themeToggleButton.innerText = "Dark Mode";
  }
};

const displayTime = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const hourString = `${hour}`;
  const minuteString = `${minute}`;

  timerHour.textContent = hourString.length < 2 ? `0${hourString}` : hourString;
  timerMinute.textContent =
    minuteString.length < 2 ? `0${minuteString}` : minuteString;
};
