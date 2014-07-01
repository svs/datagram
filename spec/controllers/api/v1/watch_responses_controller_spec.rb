require 'rails_helper'

describe Api::V1::WatchResponsesController do

  context "when status is nil" do
    let!(:wr) { FactoryGirl.build(:watch_response).tap{|wr| wr.save} }
    it "should update a watch response" do
      expect(Pusher).to receive(:trigger)
      put(:update, id: wr.token, format: :json, data: {"a" => 1}, status_code: 200)
      expect(response.status).to be 200
      expect(wr.reload.response_json).to_not be_nil
    end
  end

  context "update" do

    it "should update properly" do
      w = FactoryGirl.create(:watch)
      w.publish

      wr = WatchResponse.last
      wr.update(response_json: {data: {a: 1}},
                status_code: 200)
      expect(wr.response_json).to eql({"data" => {"a" => 1}})

      w.publish
      wr = WatchResponse.last
      wr.update(response_json: {data: {b: 2}},
                status_code: 200)
      expect(wr.response_json).to be_eql({"data" => {"b" => 2}})
      expect(wr).to be_modified
    end

  end

end
