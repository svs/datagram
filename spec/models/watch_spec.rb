require 'rails_helper'

RSpec.describe Watch, :type => :model do

  subject { create(:watch) }
  it { should be_valid }
  it { should validate_presence_of :user_id }
  it { should validate_presence_of :interval }


  it "should have data" do
    w = FactoryGirl.create(:watch, data: {"foo" => "bar"})
    expect(w.data).to be_a Hash
  end
end
