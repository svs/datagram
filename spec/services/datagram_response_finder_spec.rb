require 'rails_helper'

describe DatagramResponseFinder do
  let!(:watch) { FactoryGirl.create(:watch, name: "w1") }
  let!(:datagram) { FactoryGirl.create(:datagram, name: "Dg1", watch_ids: [watch.id]) }
  let!(:datagram_w_params) { FactoryGirl.create(:datagram_with_params) }
  describe "with no default params" do
    let(:drf) { DatagramResponseFinder.new(datagram) }
    before(:each) do
      WatchResponse.destroy_all
      datagram.publish
      wr1 = WatchResponse.last
      ap wr1
      sleep 3
      datagram.publish
      wr2 = WatchResponse.last
      wr1.update(status_code: 200, complete: true, response_json: [{a: 1},{a: 2}], response_received_at: Time.zone.now - 2)
      wr2.update(status_code: 200, complete: true, response_json: [{a: 1},{a: 2}], response_received_at: Time.zone.now - 1)
      ap wr1
    end

    it("should be ok") { expect(drf.response).to eq(WatchResponse.last) }


  end


end
