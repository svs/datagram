require 'rails_helper'


describe WatchResponse do

  describe "creation" do
    subject { FactoryGirl.build(:watch_response).tap{|wr| wr.save} }

    it "should autogenerate a token" do
      expect(subject.token).to_not be_nil
    end
  end



  describe "strip keys" do
    subject { FactoryGirl.build(:watch_response) }

    it "should strip keys properly" do
      subject.response_json = {:data => {:a => {:b => {:b1 => 1, :b2 => 2}, :c => [1,2,3]}}}
      subject.strip_keys = {:data => {:a => {:b => :b2}}}
      subject.save
      expect(subject.response_json[:data]).to eql ({:a => {:b => {:b1 => 1}, :c => [1,2,3]}})
    end
  end

end
