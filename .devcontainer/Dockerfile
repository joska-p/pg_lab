# Ubuntu 26.04 LTS development container for pg_lab.
#
# Only OS-level packages live here. The JavaScript, Rust and OpenCode
# toolchains are installed in the persistent home by post-create.sh, so an
# image rebuild does not wipe them.

FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bat \
        bc \
        build-essential \
        ca-certificates \
        curl \
        eza \
        fd-find \
        file \
        gh \
        git \
        gnupg \
        jq \
        less \
        locales \
        lsof \
        man-db \
        manpages \
        openssh-client \
        pkg-config \
        procps \
        python3 \
        ripgrep \
        rsync \
        starship \
        sudo \
        time \
        tree \
        tzdata \
        unzip \
        wget \
        xz-utils \
        zip \
        zsh \
        zsh-autosuggestions \
        zsh-syntax-highlighting \
    && ln -sfn /usr/bin/batcat /usr/local/bin/bat \
    && ln -sfn /usr/bin/fdfind /usr/local/bin/fd \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# The container user must be uid/gid 1000 to line up with the host user under
# rootless podman --userns=keep-id. Ubuntu base images ship an `ubuntu` user on
# uid 1000, so drop it before creating ours.
RUN userdel --remove ubuntu 2>/dev/null || true \
    && groupdel ubuntu 2>/dev/null || true \
    && groupadd --gid 1000 dev \
    && useradd --uid 1000 --gid 1000 --create-home --shell /usr/bin/zsh dev \
    && echo 'dev ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/dev \
    && chmod 0440 /etc/sudoers.d/dev

USER dev
WORKDIR /workspaces/pg_lab

CMD ["sleep", "infinity"]
