
set :output, "log/cron.log"

every 12.hours do
  rake "crypto_rates:new"
end

