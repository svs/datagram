FactoryGirl.define do
  factory :watch_response do
    association :watch
    token { SecureRandom.base64 }
  end
end
