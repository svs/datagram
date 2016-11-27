FactoryGirl.define do
  factory :watch_response do
    trait :completed do
      status_code 200
      completed true
      response_json [{"p"=>"2016-05-01", "count"=>1},
                     {"p"=>"2016-05-03", "count"=>6},
                     {"p"=>"2016-05-04", "count"=>3},
                     {"p"=>"2016-05-05", "count"=>2}]
    end

    factory :completed_response, traits: [:completed]
  end
end
