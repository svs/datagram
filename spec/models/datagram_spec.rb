require 'rails_helper'


describe Datagram do

  let!(:w1) { FactoryGirl.create(:watch) }
  let!(:w2) { FactoryGirl.create(:watch) }
  let!(:w3) { FactoryGirl.create(:watch) }

  describe "simple" do
    let!(:datagram) { FactoryGirl.build(:datagram, watch_ids: [w1.id, w2.id ]).tap{|d| d.save} }
    it("should have a token"){ expect(datagram.token).to be_a String}
    it("should not have publish_params") { expect(datagram.publish_params).to be_blank }
  end

  describe "with params" do
    let!(:datagram) { FactoryGirl.create(:datagram_with_params) }
    it("should have publish_params") { expect(datagram.publish_params).to eq({"a" => 1, "b" => 2})}
  end

end
