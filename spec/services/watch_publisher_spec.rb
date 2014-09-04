require 'rails_helper'

describe WatchPublisher do

  let!(:watch) { FactoryGirl.build(:watch).tap{|w| w.save } }

  context "publishing" do
    let(:wp) { WatchPublisher.new(watch) }

    it "should publish once and only once" do
      expect { 5.times {|i| wp.publish! }.to change(WatchResponse, :count).by(1) }
      r = (0..4).map {|i| wp.publish! }
      expect(r).to eql([WatchResponse.last.token, false, false, false, false])
    end

    it "should have a payload" do
      expect(wp.payload).to have_key("token")
      expect(wp.payload).to have_key(:key)
    end

  end

  context "params" do
    let!(:w) {  FactoryGirl.build(:watch, url: "http://echo.jsontest.com/key/value/{{foo}}", params: {"foo" => "bar"}, "data" => {x: "{{foo}}"}).tap{|w| w.save} }
    it "should parameterize the url" do
      expect(WatchPublisher.new(w).payload["url"] =~ /bar/).to_not be_nil
    end
    it "should parameterize the data" do
      expect(WatchPublisher.new(w).payload["data"]["x"]).to eq("bar")
    end

  end



end
