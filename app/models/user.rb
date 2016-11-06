class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :omniauthable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :watches
  has_many :watch_responses, through: :watches
  has_many :sources
  before_create :create_token

  def datagrams
    Datagram.where(user_id: self.id)
  end


  private
  def create_token
    self.token = SecureRandom.urlsafe_base64(10)
  end

end
