# common git commands:
git config --global user.email youemail@qq.com

git config --global user.name "yourusername”

git clone https://github.com/monica-li/testMonica.git

git add .

git commit -m "your comments"

git push origin master

git pull

git checkout master
(Switched to branch 'master'
Your branch is up to date with 'origin/master'.)

git branch -D master
(Deleted branch master (was 18b3451).)

git checkout -b masternew1 fabric/master
(Checking out files: 100% (178/178), done.
Branch masternew1 set up to track remote branch master from fabric.
Switched to a new branch 'masternew1'
)

git push origin :master
(To gitlab@qagit.grid.datasynapse.com:shli/fabric-testharness-ruby.git
 [deleted]         master)
 
git remote add ruby https://github.com/monica-li/testMonica.git

git remote

git fetch ruby
