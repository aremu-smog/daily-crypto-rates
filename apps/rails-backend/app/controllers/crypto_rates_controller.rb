class CryptoRatesController < ApplicationController
  require 'net/http'
  def index # rubocop:disable Metrics/MethodLength,Metrics/AbcSize
    secret_key = ENV['QUIDAX_SECRET_KEY']
    puts secret_key
    Rails.cache.fetch('daily_crypto_rates', expires_in: 1.hour) do
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
                    end.transform_keys do |key|
        new_key = key.gsub('usdt', '')
        if new_key.include?('usd')
          'usdt'
        else
          new_key
        end
      end
      last_updated = Time.now
      render json: { last_updated: last_updated.strftime('%B %d, %Y %I:%M %p'), rates: usdt_prices }
    end
  rescue StandardError => e
    render json: e
  end
end
