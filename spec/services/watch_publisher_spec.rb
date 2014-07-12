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

end
