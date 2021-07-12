# AWS EC2でISUCONの練習環境を用意するまでに色々とはまったこと

# 免責事項

**この記事で書かれている内容を実行することで、請求が発生したり、不正利用が行なわれたとしても私は責任を負いません。他の記事や公式ドキュメントなども適宜読みながら、自分の目的達成に必要な設定を決めて、実行してください。**

# TL;DR

- AWSを初めて使う場合、IMAを用意し、課金アラートをちゃんと設定するのが重要
- EC2 を建てる際は、マシンパワー×利用時間と予算の兼ね合いで判断
- （請求を考えてのことだが）EC2を利用しない場合は、停止+Elastic IP アドレスの関連付けを解除（停止してもElastic IP アドレスが紐付いているとその間も課金対象になる）


[免責事項](#免責事項)
[TL;DR](#tldr)
[EC2を建てる前に](#ec2を建てる前に)
  [AWSアカウントを作成](#awsアカウントを作成)
    [required](#required)
  [セキュリティ設定](#セキュリティ設定)
    [IAMユーザーに関して](#iamユーザーに関して)
    [参考](#参考)
[EC2を建てる](#ec2を建てる)
  [用意されているAMIを使い、環境構築を行なう](#用意されているamiを使い環境構築を行なう)
  [rootで入り、複数人で開発実行できるように整備する](#rootで入り複数人で開発実行できるように整備する)
    [参考](#参考-1)
[EC2を使っていないときに注意すること](#ec2を使っていないときに注意すること)
[最後に](#最後に)


# EC2を建てる前に

まず始めにAWSの無料枠はアカウントを作成してから1年間のみ有効です。
もし、一年以上前に作成したアカウントでは、たとえ無料枠と書かれたインスタンスであっても課金することになりますので気を付けてください。

もし、無料枠でお試しで利用したい事情がある場合は**新規で別のアカウントを作成し、[既存のアカウントは削除する](https://aws.amazon.com/jp/premiumsupport/knowledge-center/close-aws-account/)のがリスク管理上一番良いのかと思います。**

## AWSアカウントを作成

AWSトップページに「AWSアカウントを作成」ボタンがあるので、指示に従って作成しましょう

### required

- クレジットカード
- SMSまたは電話

## セキュリティ設定

アカウントを作成すると、すぐにEC2を建てたくなりますが、ちょっと待って下さい。

今作成したアカウントはrootユーザーなので、このままではセキュリティリスクが高いです。

そのため初回は、以下の項目を設定する必要があります。

- ルートアカウントの[Multi-Factor Authentication](https://aws.amazon.com/jp/iam/details/mfa/#%E4%BB%AE%E6%83%B3_MFA_%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3)を設定する
- パスワードポリシーを設定
- IAMユーザー、IAMグループを作成（[AWS Hands-on for Beginners](https://pages.awscloud.com/event_JAPAN_Ondemand_Hands-on-for-Beginners-1st-Step_CP.html)を参照）*
- 料金アラートの設定（[こちら](https://tipstour.net/aws-budget-alert)を参照） *
- [AWS CloudTrail](https://aws.amazon.com/jp/cloudtrail/)を設定する（S3パケットを利用するため注意）

特に*を付けた項目はmustなので、絶対に設定してください。

### IAMユーザーに関して

特にIAMユーザーに関しては、個人利用の場合はグループでの管理は気にしなくても大丈夫ですが、チームで利用する場合はグループごとに、IAMポリシー（アクセス許可の定義）の設定を行なう必要があります。

チームで利用する場合は、パスワードポリシーと一緒に、ポリシーの設定にも気を付けましょう。

### 参考

[初めてのAWS (Amazon Web Service)](https://qiita.com/terappy/items/1e10bb85505acac5c282#%E3%83%AA%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E3%82%92%E5%A4%89%E6%9B%B4)

[(初心者向け) AWSのアカウントを守るために最低限やっておきたいことまとめ ( IAMメイン )](https://qiita.com/saba_can00/items/1c66d2dc5a747cd6d55d)

[AWSアカウントを取得したら速攻でやっておくべき初期設定まとめ](https://qiita.com/tmknom/items/303db2d1d928db720888#awsマネジメントコンソールへの不正アクセスを検知する仕組みの構築)

# EC2を建てる

ようやくメインの話題です。

元々、この記事の目的はISUCONの過去問練習環境の構築です。また今回は複数人で練習を行なうので、そのために必要な準備も書いていきます

## 用意されているAMIを使い、環境構築を行なう

[この記事](https://qiita.com/TOGEP/items/5a4f0a4fa0cda2f32b0b)通りに実行していきます。

1. 東京リージョンからEC2 AMIでISUCONを検索
2. インスタンスタイプの選択（本番環境と同じマシン構成にするのは、慣れてからの方が良いと思います。そのため今回はt2.microを選択）
3. キーペアの作成
    1. ダウンロードしたpemファイルを無くさないように.sshに移動
    2. 自分だけが読めるよう権限の変更
4. セキュリティグループの設定
    1. SSHとHTTPを設定

## rootで入り、複数人で開発実行できるように整備する

前述したとおり、今回は複数人で練習を行なうため、ユーザーを追加する必要があります。

まずイメージ内にあるデフォルトのユーザーでログインを行ないます。イメージ内のユーザー名は分かりませんが、ubuntuかrootでとりあえず入ることが出来ると思います（一種の総当たり方です）

```bash
ssh -i hoge.pem ubuntu@[IPv4 パブリック IP]
```

次に、[https://gist.github.com/kyfk/b7d47ac8f8a1cfcce619862d94599201](https://www.notion.so/b7d47ac8f8a1cfcce619862d94599201) こちらの記事を参照しつつ、ユーザーを作成していきます。

```bash
# root化
sudo su -
# ${USERNAME} を作る。${USERNAME}は適当なユーザー名を入力してください
useradd -d /home/isucon -m ${USERNAME}
sudo usermod -aG sudo ${USERNAME}
curl https://github.com/${USERNAME}.keys > authorized_keys
chmod 700 /home/${USERNAME}/.ssh/
chmod 600 /home/${USERNAME}/.ssh/authorized_keys
```

因みに味噌なのは、ssh-keygenを使わず、GIthubに公開されている鍵を使う点です。これで、秘密鍵を各自作って貰って、共有するという作業は原則必要なくなります。

またユーザー追加後に、各自にsudoコマンドが利用できるようにグループに追加していますが、Debianの場合は、sudoグループ。CentOSの場合はwheelグループになるので注意。

この後は

```bash
ssh ${USERNAME}@[IPv4 パブリック IP]
```

で各自ストレスなく、すぐに練習に移れると思います。

### 参考

[ISUCON過去問環境構築](https://qiita.com/TOGEP/items/5a4f0a4fa0cda2f32b0b#%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%81%AE%E8%A8%AD%E5%AE%9A)

[isucon.md](https://www.notion.so/b7d47ac8f8a1cfcce619862d94599201)

[Ubuntuユーザ追加とsudo権限付与。ユーザ/グループ操作まとめ](https://www-creators.com/archives/241)

# EC2を使っていないときに注意すること

これは実際にやらかした体験なので、注意もかねて書いておきます。

EC2を利用しない場合は、停止するのは皆さん最初に考えると思いますが、これだけでは不十分で[Elastic IP アドレスの関連付けも同時に解除しないといけません。](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)

使っていないときは、皆さん課金されない設定になっているか確認してください。

# 最後に

ここまで書きましたが、内容が誤っていたり不十分な点があれば、こちら[https://github.com/smirror/BabelCode/issues](https://github.com/smirror/BabelCode/issues) へお願いします。
