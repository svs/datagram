require 'rails_helper'

describe WatchResponsesController do

  context "status is nil" do
    it "should update a watch response" do
      w = FactoryGirl.build(:watch).tap{|f| f.save }
      w.publish
      d = WatchResponse.last
      ap d
      put(:update, id: d.token, format: :json)
      ap response.body
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
      expect(wr.diff).to be_eql({"data" => [["+","a",1]]})

      w.publish
      wr = WatchResponse.last
      wr.update(response_json: {data: {b: 2}},
                status_code: 200)
      expect(wr.response_json).to be_eql({"data" => {"b" => 2}})
      expect(wr.diff).to be_eql({"data" => [["-","a",1],["+","b",2]]})
    end

  end

end
