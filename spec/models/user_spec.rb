require 'rails_helper'

RSpec.describe User, :type => :model do
  subject { create(:user) }
  it { should be_valid }
  it { should have_many :watches }

end
