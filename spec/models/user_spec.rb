require 'rails_helper'

RSpec.describe User, :type => :model do
  subject { build(:user).tap{|u| u.save } }
  it { should be_valid }
  its(:token) { should_not be nil }

end
