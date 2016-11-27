FactoryGirl.define do
  factory :datagram do
    name "foo"
    watch_ids [1]
    trait :has_publish_params do
      publish_params({a: 1, b: 2})
    end

    factory :datagram_with_params, traits: [:has_publish_params]
  end
end
