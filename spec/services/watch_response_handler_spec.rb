require 'rails_helper'

describe WatchResponseHandler do

  let!(:watch) { FactoryGirl.create(:watch) }
  let!(:watch_response) { WatchResponse.create(watch_id: watch.id) }

  before(:each) {
    response = File.read('spec/fixtures/r.json')
    json = JSON.parse(response)
    json["id"] = watch_response.token
    @handler = WatchResponseHandler.new(json)
  }

  it "should handle properly" do
    @handler.handle!
    wr = watch_response.reload
    expect(wr.response_json).to be_a Hash
    expect(wr.report_time).to be_a ActiveSupport::TimeWithZone
  end

  context "when report_time exists" do
    it "should not overwrite the report time" do
      d = Date.new(2014,1,1,)
      watch_response.update_attribute(:report_time, d)
      @handler.handle!
      expect(watch_response.reload.report_time).to eq d
    end
  end

  context "when report time is obtained from json" do
    it "should use the reported time" do
      watch.update_attribute(:report_time, '$.data.currently.time')
      @handler.handle!
      ap watch_response.reload
    end
  end
end
