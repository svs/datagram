# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :watch do
    user_id 1
    trait :has_sql_params do
      data({ query: "{{a}}" })            
      params ({"a" => "foo"})
    end

    trait :has_data_params do
      data({foo: "{{b}}"}) 
      params({"b" => "bar"})
    end
  end
end
