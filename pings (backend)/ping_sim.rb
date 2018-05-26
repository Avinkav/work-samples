BASE_URL = "http://localhost:3000"
HTTPS = false

require 'securerandom'
require 'typhoeus'
require 'faker'

hydra = Typhoeus::Hydra.new

# Simulate concurrent ping inserts
Array.new(100){ |i|
    hydra.queue Typhoeus::Request.new("#{BASE_URL}/#{}/#{Date.now.strftime}", method: :post)
}
hydra.run



# Simulate concurrent ping reads
