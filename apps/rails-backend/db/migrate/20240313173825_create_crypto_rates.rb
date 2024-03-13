class CreateCryptoRates < ActiveRecord::Migration[7.1]
  def change
    create_table :crypto_rates do |t|
      t.text :body

      t.timestamps
    end
  end
end
