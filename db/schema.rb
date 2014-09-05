# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140905081219) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "datagrams", force: true do |t|
    t.string   "name"
    t.integer  "watch_ids",                       array: true
    t.string   "at"
    t.integer  "frequency"
    t.integer  "user_id"
    t.string   "token"
    t.boolean  "use_routing_key"
    t.integer  "last_update_timestamp", limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", force: true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "token"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "watch_responses", force: true do |t|
    t.integer  "watch_id"
    t.integer  "datagram_id"
    t.integer  "status_code"
    t.datetime "response_received_at"
    t.integer  "round_trip_time"
    t.json     "response_json"
    t.json     "error"
    t.string   "signature"
    t.boolean  "modified"
    t.integer  "elapsed"
    t.json     "strip_keys"
    t.json     "keep_keys"
    t.integer  "started_at"
    t.integer  "ended_at"
    t.string   "token"
    t.boolean  "preview"
    t.integer  "timestamp",            limit: 8
    t.datetime "created_at"
    t.datetime "updated_at"
    t.json     "params"
    t.datetime "report_time"
  end

  create_table "watches", force: true do |t|
    t.integer  "user_id"
    t.json     "data"
    t.integer  "frequency"
    t.string   "at"
    t.string   "name"
    t.string   "url"
    t.string   "method",              default: "get"
    t.string   "webhook_url"
    t.string   "protocol",            default: "http"
    t.string   "token"
    t.json     "strip_keys"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.json     "keep_keys"
    t.string   "last_response_token"
    t.boolean  "use_routing_key"
    t.string   "slug"
    t.json     "params"
    t.string   "report_time"
  end

end
