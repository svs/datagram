require 'rails_helper'

describe "Models" do


  it "should do everything properly" do
    WatchResponse.destroy_all
    @user = FactoryGirl.create(:user)
    ap @user
    @watch = FactoryGirl.build(:watch,
                              url: "https://api.forecast.io/forecast/d85744ba9a05b8b90909787e7f513821/19,73",
                              user_id: @user.id).tap{|w| w.save}
    ap @watch
    @watch.publish(preview: true)
    expect(WatchResponse.count).to eq 1
    i = 0
    while WatchResponse.last.status_code == nil
      ap status_code: WatchResponse.last.status_code
      sleep 1
      i += 1
      if i == 10
        ap "something broke. Exiting..."
        exit
      end
    end
    @datagram = FactoryGirl.create(:datagram, watch_ids: [@watch.id], user_id: @user.id)
    ap @datagram


  end



end
