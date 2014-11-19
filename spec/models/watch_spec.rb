require 'rails_helper'

RSpec.describe Watch, :type => :model do

  subject { build(:watch).tap{|w| w.save } }
  it { should be_valid }
  it { should validate_presence_of :user_id }
  it { should have_attribute :data }

  it "should automatically have a token" do
    expect(subject.token).to_not be_nil
  end


  describe "publish" do
    let!(:w) {  FactoryGirl.create(:watch, data: {"foo" => "bar"}) }

    it "should create a watch response" do
      expect { w.publish }.to change(WatchResponse, :count).by(1)
    end

    it "the created watch response should be findable by the token" do
      token = w.publish
      expect(WatchResponse.find_by(token: token)).to be_a WatchResponse
    end
  end

  it "should report url correctly" do
    source = Source.create(url: "foo")
    watch = FactoryGirl.create(:watch, url: "bar")
    expect(watch.url).to eq  "bar"
    watch.source = source
    expect(watch.url).to eq  "foo"
  end



end
