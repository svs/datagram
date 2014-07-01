require 'rails_helper'

RSpec.describe Watch, :type => :model do

  subject { build(:watch).tap{|w| w.save } }
  it { should be_valid }
  it { should validate_presence_of :user_id }


  it "should have a token" do
    expect(subject.token).to_not be_nil
  end

  it "should have data" do
    w = FactoryGirl.create(:watch, data: {"foo" => "bar"})
    expect(w.data).to be_a Hash
  end


  describe "publish" do
    let!(:w) {  FactoryGirl.create(:watch, data: {"foo" => "bar"}) }

    it "should log" do
      expect { w.publish }.to change(WatchResponse, :count).by(1)
    end

    it "should publish properly" do
      x = w.publish
      expect(WatchResponse.find(x)).to be_a WatchResponse
    end
  end

end
