"use client"
import List from "@/components/customComponents/list";
import { IUser } from "@/migrations/Migration";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function Users() {
  const [users, setUsers] = useState<
    IUser[] | null
  >(null);
  const router = useRouter();
  const [currentItems, setCurrentItems] = useState<IUser[] | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<
    IUser[] | null
  >(null);

  const heading: string[] = useMemo(
    () => ["ID", "Name", "Email","Status"],
    []
  );

  const [indexOfFirstItem, setIndexOfFirstItem] = useState<number | null>(null);
  const [indexOfLastItem, setIndexOfLastItem] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (users == null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/users/all_users",
            {},
            { withCredentials: true }
          );
          setUsers(response.data.data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setUsers([]);
        }
      })();
    }
  }, [users]);

  useEffect(() => {
    setFilteredUsers(
      users
        ? users.filter((user) =>
            user.name.toLowerCase().includes(search.toLowerCase())
          )
        : []
    );
  }, [search, users]);

  useEffect(() => {
    setIndexOfLastItem(currentPage * itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (indexOfLastItem) setIndexOfFirstItem(indexOfLastItem - itemsPerPage);
  }, [indexOfLastItem, itemsPerPage]);

  useEffect(() => {
    if (
      filteredUsers &&
      indexOfFirstItem !== null &&
      indexOfLastItem !== null
    ) {
      setCurrentItems(
        filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
      );
    }
  }, [
    filteredUsers,
    currentPage,
    itemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  ]);

  return (
    <div>
      {currentItems &&
      Array.isArray(currentItems) &&
      currentItems.length > 0 ? (
        <List
          heading={heading}
          listTitle="Users"
          search={search}
          setSearch={setSearch}
        >
          {indexOfFirstItem !== null &&
            currentItems.map((user, index) => (
              <tr
                className="border-b cursor-pointer hover:bg-gray-100 transition"
                onClick={() => router.push(`/admin/users/details?user_name=${user.name}&user_id=${user.id}`)}
                key={index}
              >
                <td className="py-3 px-4">{indexOfFirstItem + index + 1}</td>
                <td className="py-3 px-4">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_USER_API_ASSETS_URL}/${user.image}`}
                    width={80}
                    height={100}
                    alt="User Image"
                    className="transition-opacity rounded-md duration-200"
                  />
                </td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">
                  {user.is_active ? "Online" : "Offline"}
                </td>
              </tr>
            ))}
        </List>
      ) : (
        <p className="italic">No Users...</p>
      )}
      {indexOfLastItem !== null &&
        filteredUsers &&
        currentItems &&
        currentItems.length > 0 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 cursor-pointer hover:underline text-sm rounded mx-1"
            >
              Prev
            </button>
            <span className="px-4 py-2">{currentPage}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  indexOfLastItem < filteredUsers.length ? prev + 1 : prev
                )
              }
              disabled={indexOfLastItem >= filteredUsers.length}
              className="px-3 font-semibold cursor-pointer text-sm  text-white bg-black rounded mx-1"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}

export default Users;
