require 'rails_helper'

RSpec.describe Watch, :type => :model do

  subject { create(:watch) }
  it { should be_valid }
  it { should validate_presence_of :user_id }
  it { should validate_presence_of :frequency }


  it "should have data" do
    w = FactoryGirl.create(:watch, data: {"foo" => "bar"})
    expect(w.data).to be_a Hash
  end


  it "should create a log entry" do
    w = FactoryGirl.build(:watch, data: {"foo" => "bar"})
    expect { w.save }.to change(DekkoLog, :count).by(1)
    d = DekkoLog.last
    expect(d.watch).to be_eql(w)
  end


end
