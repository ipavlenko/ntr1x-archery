<?php

namespace AppBundle\Security;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use JMS\Serializer\Annotation as JMS;

class UserPrincipal implements \Serializable
{
    private $id;
    private $email;

    public function __construct($id, $email) {
        $this->id = $id;
        $this->email = $email;
    }

    public function getId() {
        return $this->id;
    }

    public function getEmail() {
        return $this->email;
    }

    /** @see \Serializable::serialize() */
    public function serialize() {

        return serialize(array(
            $this->id,
            $this->email,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized) {

        list(
            $this->id,
            $this->email,
        ) = unserialize($serialized);
    }

    public function __toString() {
        return "{$this->id}:{{$this->email}}";
    }
}
