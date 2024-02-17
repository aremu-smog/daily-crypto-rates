class CryptoRatesController < ApplicationController
  require 'net/http'
  def index
    Rails.cache.fetch('daily_crypto_rates', expires_in: 1.hour) do
      secret_key = ENV['QUIDAX_SECRET_KEY']
      uri = URI('https://www.quidax.com/api/v1/markets/tickers')
      req = Net::HTTP::Get.new(uri)
      req['Authorization'] = "Bearer #{secret_key}"

      res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }

      res_body = JSON.parse(res.body)
      data = res_body['data']
      usdt_prices = data.filter do |key, value|
                      key.include?('usdt') && value['ticker']['last'].to_f > 0.0
                    end.transform_values do |value|
                      value['ticker']['last']
                    end.transform_keys { |key| key.gsub('usdt', '') }
      last_updated = Time.now
      render json: { last_updated: last_updated.strftime('%B %d, %Y %I:%M %p'), rates: usdt_prices }
    end
  rescue StandardError => e
    render json: e
  end
end
