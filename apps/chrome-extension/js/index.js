const mainWrapper = document.querySelector("body");

const lastUpdated = document.querySelector("#last-updated-date");
const cryptoRatesTable = document.querySelector("#crypto-rates-table");

window.addEventListener("load", async (e) => {
  const cryptoRatesInStorage = await getCryptoRates();

  await updateDomWithCryptoInfo(cryptoRatesInStorage);

  const cryptoRatesFromServer = await fetchCryptoRates();

  await updateDomWithCryptoInfo(cryptoRatesFromServer);
});

const updateDomWithCryptoInfo = async (data) => {
  const hasData = Object.keys(data).length > 0;
  const cryptoInfo = await fetchCryptoInfo();

  if (hasData) {
    lastUpdated.innerText = formatDate(data.last_updated);
    populateTable(cryptoInfo, data.rates);
  }
};
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
  if (!cryptoPrices) {
    console.warn("[populate-table]", "No crypto prices available");
    return;
  }
  cryptoRatesTable.innerHTML = "";
  const tableRows = cryptoInfo.map((crypto) => {
    const { name = "", code = "" } = crypto;
    const price = cryptoPrices[code];

    const row = document.createElement("tr");

    row.innerHTML = `
			<td>${name}</td>
			<td>${code.toUpperCase()}</td>
			<td>$ ${formatAmount(price)}</td>
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
    console.error("[crypto-rates-api]", e.message);
  } finally {
    cryptoData = await getCryptoRates();
    return cryptoData;
  }
};

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
