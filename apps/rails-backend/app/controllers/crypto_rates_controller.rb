# frozen_string_literal: true

# CryptoRatesController
class CryptoRatesController < ApplicationController
  require 'quidax'
  def index # rubocop:disable Metrics/MethodLength
    secret_key = ENV['QUIDAX_SECRET_KEY']
    quidax_object = Quidax.new(secret_key)

    data = Rails.cache.fetch('daily_crypto_rates', expires_in: 1.hour) do
      all_market_tickers = QuidaxMarkets.get_all_tickers(q_object: quidax_object)

      usdt_prices = transform_market_tickers(all_market_tickers['data'])

      last_updated = Time.now
      { last_updated: last_updated.strftime('%B %d, %Y %I:%M %p'), rates: usdt_prices }
    end
    render json: data
  rescue StandardError => e
    render json: e
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
