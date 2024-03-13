# frozen_string_literal: true

namespace :crypto_rates do
  desc 'Add new entry to the DB with daily crypto rates'
  task new: :environment do
    
    puts "=============== Fetch New Crypto Rates ==============="
    empty_lines 2
    secret_key = ENV['QUIDAX_SECRET_KEY']
    quidax_object = Quidax.new(secret_key)

    begin
      puts "........... Connecting to API ..........."
      all_market_tickers = QuidaxMarkets.get_all_tickers(q_object: quidax_object)
      empty_lines 2
      
      usdt_prices = transform_market_tickers(all_market_tickers['data'])
      puts "........... Fetched Crypto Rates ..........."
      empty_lines 2

      new_crypto_rates = CryptoRate.new(body: usdt_prices.to_json)

      puts "=============== ✅ New Crypto Rates Saved ===============" if new_crypto_rates.save

    rescue StandardError => e
      puts "[new-crypto-rates-error] #{e.message}"
    end
  end

  def transform_market_tickers(market_tickers)
    market_tickers.filter! do |key, value|
      key.include?('usdt') && value['ticker']['last'].to_f > 0.0
    end

    usdt_last_prices = market_tickers.transform_values { |value| value['ticker']['last'] }

    usdt_last_prices.transform_keys do |key|
      new_key = key.gsub('usdt', '')
      new_key = 'usdt' if new_key == 'usd'
      new_key
    end
  end

  def empty_lines(no = 3) 
    no.times {puts ""}
  end
end
