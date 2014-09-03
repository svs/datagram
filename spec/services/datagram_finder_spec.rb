require 'rails_helper'

describe DatagramFinder do

  let!(:watch) { FactoryGirl.build(:watch, name: "watch").tap{|w| w.save } }
  let!(:datagram) { FactoryGirl.create(:datagram, watch_ids: [watch.id], last_update_timestamp: 2) }
  let!(:wr_now) { FactoryGirl.create(:watch_response, watch_id: watch.id, datagram_id: datagram.id, timestamp: 1, created_at: Time.now) }
  let!(:wr_yesterday) { FactoryGirl.create(:watch_response, watch_id: watch.id, datagram_id: datagram.id, timestamp: 2, created_at: Time.now - 1.day) }

  it "should setup correctly" do
    ap datagram.as_json
  end

end
