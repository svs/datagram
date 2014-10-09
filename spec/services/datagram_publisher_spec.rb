require 'rails_helper'

describe DatagramPublisher do

  before(:each) {
    WatchResponse.destroy_all
  }


  context "without params" do
    let!(:w1) { FactoryGirl.create(:watch) }
    let!(:w2) { FactoryGirl.create(:watch) }
    let!(:datagram) { FactoryGirl.build(:datagram, watch_ids: [w1.id, w2.id]) }
    let!(:publisher) { DatagramPublisher.new(datagram: datagram) }

    it "should create 2 watch responses" do
      expect { publisher.publish! }.to change(WatchResponse, :count).by(2)
    end
  end
  
  context "with params" do
    context "watch has params" do
      let!(:w1) { FactoryGirl.create(:watch, :has_sql_params) }
      let!(:w2) { FactoryGirl.create(:watch, :has_data_params) }
      let!(:datagram) { FactoryGirl.create(:datagram, watch_ids: [w1.id, w2.id])}
      it "should publish with params" do
        datagram.publish
        expect(WatchResponse.first.params).to eq(w1.params)
        expect(WatchResponse.last.params).to eq(w2.params)
      end
    end

    context "datagram has params" do
      let!(:w1) { FactoryGirl.create(:watch, :has_sql_params) }
      let!(:w2) { FactoryGirl.create(:watch, :has_data_params) }
      let!(:datagram) { FactoryGirl.create(:datagram, watch_ids: [w1.id, w2.id], publish_params: {"a" => "moo"})}
      it "should merge provided params with watch params" do
        datagram.publish({"a" => "moo"})
        expect(WatchResponse.first.params).to eq({"a" => "moo"})
        expect(WatchResponse.last.params).to eq({"a" => "moo"}.merge(w2.params))
      end
      
    end

    context "datagram published with params" do
      context "flat params" do
        let!(:w1) { FactoryGirl.create(:watch, :has_sql_params) }
        let!(:w2) { FactoryGirl.create(:watch, :has_data_params) }
        let!(:datagram) { FactoryGirl.create(:datagram, watch_ids: [w1.id, w2.id])}
        it "should merge provided params with watch params" do
          datagram.publish({"a" => "baz"})
          expect(WatchResponse.first.params).to eq({"a" => "baz"})
          expect(WatchResponse.last.params).to eq({"a" => "baz"}.merge(w2.params))
        end
      end

      context "params with watch ids as keys" do
        let!(:w1) { FactoryGirl.create(:watch, :has_sql_params) }
        let!(:w2) { FactoryGirl.create(:watch, :has_data_params) }
        let!(:datagram) { FactoryGirl.create(:datagram, watch_ids: [w1.id, w2.id])}
        it "should publish each watch with the corresponding params" do
          datagram.publish({w1.id => {"a" => "quux"}})
          expect(WatchResponse.first.params).to eq({"a" => "quux"})
          expect(WatchResponse.last.params).to eq(w2.params)
        end
      end
    end

  end
end
