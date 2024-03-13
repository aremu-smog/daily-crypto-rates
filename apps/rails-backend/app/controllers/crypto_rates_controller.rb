# frozen_string_literal: true

# CryptoRatesController
class CryptoRatesController < ApplicationController
  require 'quidax'
  def index # rubocop:disable Metrics/MethodLength

    last_crypto_rate = CryptoRate.last

    return render json: {} if last_crypto_rate.nil?

    last_updated = last_crypto_rate.created_at
    rates = JSON.parse(last_crypto_rate.body)
    data = { last_updated: last_updated, rates: rates }

    render json: data
  rescue StandardError => e
    puts e.message
  end

  private

  def transform_market_tickers(market_tickers)
    market_tickers.filter do |key, value|
      key.include?('usdt') && value['ticker']['last'].to_f > 0.0
    end

    usdt_last_prices = market_tickers.transform_values { |value| value['ticker']['last'] }

    usdt_last_prices.transform_keys do |key|
      new_key = key.gsub('usdt', '')
      new_key = 'usdt' if new_key == 'usd'
      new_key
    end
  end
end
